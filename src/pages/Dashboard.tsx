import React from 'react';
import BalanceCards from './BalanceCards';
import Categories from './Categories';
import TransactionsPreview from './TransactionsPreview';
import Analysis from './Analysis';
import Debts from './Debts';
import Investments from './Investments';
import Goals from './Goals';
import Accounting from './Accounting';
import './Dashboard.css'; // Importing CSS for smooth scrolling

const Dashboard = () => {
    return (
        <div className="dashboard-container" style={{ scrollBehavior: 'smooth' }}>
            <BalanceCards />
            <Categories />
            <TransactionsPreview />
            <Analysis />
            <Debts />
            <Investments />
            <Goals />
            <Accounting />
        </div>
    );
};

export default Dashboard;