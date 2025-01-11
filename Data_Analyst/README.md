# Financial and Blockchain Data Analysis

This project focuses on analyzing financial transactions from traditional systems and blockchain data, particularly Ethereum transactions. It involves data collection, preparation, analysis, and visualization using various Python libraries and real-time monitoring tools like Grafana and Prometheus.

## Table of Contents
- [Introduction](#introduction)
- [Data Collection](#data-collection)
- [Data Understanding](#data-understanding)
- [Data Preparation](#data-preparation)
- [Data Analysis](#data-analysis)
- [Real-Time Dashboard](#real-time-dashboard)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

This project provides insights into user behavior, financial trends, and transaction flows for both traditional and blockchain systems. It analyzes the volume of transactions, spending behavior, and cryptocurrency movements on the Ethereum blockchain.

The primary objective is to:
1. Explore traditional and blockchain transaction data.
2. Visualize financial trends and transaction flows.
3. Use real-time dashboards to monitor blockchain activity.

## Data Collection

We collected data from two main sources:
1. **Traditional Financial Transactions**: Data related to payments, transfers, and other centralized operations, extracted from databases (e.g., MySQL) using APIs.
2. **Blockchain Transactions**: Ethereum transaction data was collected using the **Infura API** and **Web3.py** library. The collected data includes block numbers, transaction hashes, sender and receiver addresses, Ether value, gas used, gas price, and transaction dates.

Example code to connect to Ethereum via Infura and retrieve blockchain data:
```python
from web3 import Web3

infura_url = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
w3 = Web3(Web3.HTTPProvider(infura_url))

if w3.is_connected():
    print("Connected to Ethereum Mainnet")
else:
    print("Failed to connect")
```

## Data Understanding

Before analysis, we performed exploratory data analysis (EDA) using functions like `head()`, `dtypes()`, and `describe()` to understand the structure and distribution of the data. We also checked for missing values and analyzed the unique distributions of different columns.

```python
# Example: Viewing the first few rows of the dataset
df.head()
```

## Data Preparation

To ensure the data was clean and ready for analysis, we applied the following steps:
1. **Dropped irrelevant columns**: Removed unnecessary columns like `Timestamp`.
2. **Converted data types**: Ensured that columns like `Transaction Date` were in datetime format and that numerical fields were in the correct types.
3. **Handled missing values**: Dropped transactions with missing critical information, such as recipient addresses.
4. **Removed outliers**: Used interquartile range (IQR) to filter out extreme values for Ether transactions and gas fees.

```python
# Example: Removing outliers
df = remove_outliers_iqr(df, 'Value_ETH')
```

## Data Analysis

The analysis focused on understanding:
1. **Transaction Volumes**: Analyzing the number of transactions and the total Ether transferred per block.
2. **Spending Behavior**: Identifying the largest spenders and the most active addresses in terms of transaction count.
3. **Cryptocurrency Movements**: Visualizing the flow of Ether between addresses and the total movement per block.

Example: Analyzing transaction volumes per block:
```python
volume_transactions_par_bloc = df.groupby('Block_Number')['Value_ETH'].agg(['count', 'sum']).reset_index()
```

## Real-Time Dashboard

We created a real-time dashboard using **Grafana** and **Prometheus** to monitor blockchain transactions in real-time. The dashboard includes the following visualizations:
- **Number of transactions per minute**.
- **Total Ether transferred per block**.
- **Gas fees per block**.

The metrics are collected by Prometheus and visualized in Grafana, providing continuous insights into Ethereum blockchain activity.

## Technologies Used
- **Backend**: Python, Web3.py
- **Data Processing**: pandas, numpy
- **Visualization**: Matplotlib, Seaborn, Plotly, Grafana
- **Blockchain API**: Infura
- **Real-Time Monitoring**: Prometheus, Grafana
- **Database**: MySQL for traditional financial transactions

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/FinTech-data-analysis.git
   ```
2. Set up Grafana and Prometheus for real-time monitoring. Refer to the documentation for setup instructions:
   - [Prometheus Setup](https://prometheus.io/docs/introduction/overview/)
   - [Grafana Setup](https://grafana.com/docs/grafana/latest/getting-started/)

