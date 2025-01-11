from web3 import Web3
from prometheus_client import start_http_server, Gauge
import time
import plotly.graph_objs as go
from plotly.subplots import make_subplots
import plotly.express as px
import pandas as pd

# Connect to Infura or another Ethereum provider
infura_url = 'https://mainnet.infura.io/v3/00eda8a58f914657a92f986d6d10a529'
web3 = Web3(Web3.HTTPProvider(infura_url))

# Prometheus metrics to track transaction count, gas used, total value transferred, token transfers, and tokens exchanged
transaction_count_gauge = Gauge('ethereum_transaction_count', 'Number of transactions per block')
gas_used_gauge = Gauge('ethereum_gas_used', 'Total gas used in block')
total_value_gauge = Gauge('ethereum_total_value', 'Total value of ETH transferred in block')
token_transfer_gauge = Gauge('ethereum_token_transfer_count', 'Number of token transfers in block')
eth_transferred_gauge = Gauge('ethereum_eth_transferred', 'Total amount of ETH transferred in block')
erc20_transfers_gauge = Gauge('ethereum_erc20_transfers', 'Total amount of ERC-20 tokens transferred in block')

# Initialize a DataFrame to store historical data for visualization
historical_data = pd.DataFrame(columns=['Block', 'Transaction Count', 'Gas Used', 'Total Value', 'ETH Transferred', 'Token Transfers'])

# Function to get details about ERC-20 transfers
def fetch_erc20_transfer(tx, contract):
    try:
        # The 'transfer' method for ERC-20 tokens usually has the signature: transfer(address, uint256)
        # This tries to decode the input data and extract the transferred value
        decoded_input = contract.decode_function_input(tx.input)
        if decoded_input[0].fn_name == 'transfer':
            return decoded_input[1]['_value']  # Get the value transferred (in tokens)
    except:
        return 0  # Return 0 if decoding fails or no transfer is found

# Function to fetch data from the latest block and update Prometheus metrics
def fetch_block_data():
    global historical_data

    # Get the latest block with full transactions
    latest_block = web3.eth.get_block('latest', full_transactions=True)

    # Initialize cumulative values
    total_value_transferred = 0  # ETH transferred
    total_erc20_transfers = 0  # Token transfer count
    eth_transferred = 0  # ETH transferred value in the block

    # Extract block details
    transaction_count = len(latest_block.transactions)
    gas_used = latest_block.gasUsed

    # Iterate over each transaction to extract ETH and token transfers
    for tx in latest_block.transactions:
        # Value of the transaction in ETH
        tx_value = web3.from_wei(tx['value'], 'ether')
        total_value_transferred += tx_value
        eth_transferred += tx_value  # Track ETH transfers

        # Check if the transaction is an ERC-20 token transfer
        if tx['to']:
            to_address = web3.to_checksum_address(tx['to'])
            # Check if 'to' is a contract address (for ERC-20 tokens)
            if web3.eth.get_code(to_address).hex() != '0x':
                contract = web3.eth.contract(address=to_address, abi=[{
                    "constant": False,
                    "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
                    "name": "transfer",
                    "outputs": [],
                    "type": "function"
                }])
                token_value = fetch_erc20_transfer(tx, contract)
                if token_value > 0:
                    total_erc20_transfers += 1

    # Set Prometheus metrics
    transaction_count_gauge.set(transaction_count)
    gas_used_gauge.set(gas_used)
    total_value_gauge.set(total_value_transferred)
    token_transfer_gauge.set(total_erc20_transfers)
    eth_transferred_gauge.set(eth_transferred)

    # Update historical data
    new_row = {
        'Block': latest_block.number,
        'Transaction Count': transaction_count,
        'Gas Used': gas_used,
        'Total Value': total_value_transferred,
        'ETH Transferred': eth_transferred,
        'Token Transfers': total_erc20_transfers
    }
    historical_data = historical_data.append(new_row, ignore_index=True)

    # Visualize the data
    visualize_data()

# Function to visualize the data using Plotly
def visualize_data():
    global historical_data

    # Create subplots
    fig = make_subplots(rows=3, cols=1, subplot_titles=("Transaction Count", "ETH Transferred", "Token Transfers"))

    # Add traces
    fig.add_trace(go.Scatter(x=historical_data['Block'], y=historical_data['Transaction Count'], name="Transaction Count"), row=1, col=1)
    fig.add_trace(go.Scatter(x=historical_data['Block'], y=historical_data['ETH Transferred'], name="ETH Transferred"), row=2, col=1)
    fig.add_trace(go.Scatter(x=historical_data['Block'], y=historical_data['Token Transfers'], name="Token Transfers"), row=3, col=1)

    # Update layout
    fig.update_layout(height=900, width=1200, title_text="Blockchain Financial Trends")
    fig.show()

if __name__ == "__main__":
    # Start the Prometheus exporter on port 8000
    start_http_server(8000)

    # Fetch and update metrics every 10 seconds
    while True:
        fetch_block_data()
        time.sleep(10)