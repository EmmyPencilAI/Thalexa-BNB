import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thalexa Wallet'),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_outlined),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWalletCard(context),
            const SizedBox(height: 32),
            const Text(
              'Assets',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildAssetList(),
            const Text(
              'Recent Activity',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildTransactionList(),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionList() {
    final transactions = [
      {'type': 'Received', 'amount': '+0.5 BNB', 'date': 'Today, 2:45 PM', 'icon': Icons.arrow_downward, 'color': Colors.green},
      {'type': 'Sent', 'amount': '-120 USDT', 'date': 'Yesterday, 10:20 AM', 'icon': Icons.arrow_upward, 'color': Colors.red},
      {'type': 'Minted', 'amount': 'ID: THLX-002', 'date': 'Oct 24, 2023', 'icon': Icons.auto_awesome, 'color': Colors.orange},
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: transactions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final tx = transactions[index];
        return ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          tileColor: Colors.white.withOpacity(0.05),
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (tx['color'] as Color).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(tx['icon'] as IconData, color: tx['color'] as Color, size: 20),
          ),
          title: Text(tx['type'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: Text(tx['date'] as String, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          trailing: Text(
            tx['amount'] as String,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: (tx['amount'] as String).startsWith('+') ? Colors.green : Colors.white,
            ),
          ),
        );
      },
    );
  }

  Widget _buildWalletCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            Colors.deepOrange.shade900,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Total Balance',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 8),
          const Text(
            '\$12,450.00',
            style: TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: _buildActionButton(Icons.arrow_upward, 'Send'),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(Icons.arrow_downward, 'Receive'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: Colors.white),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildAssetList() {
    final assets = [
      {'name': 'BNB', 'symbol': 'BNB', 'balance': '4.5', 'value': '\$2,700.00', 'color': Colors.yellow.shade700},
      {'name': 'Tether', 'symbol': 'USDT', 'balance': '8,200', 'value': '\$8,200.00', 'color': Colors.green},
      {'name': 'USD Coin', 'symbol': 'USDC', 'balance': '1,550', 'value': '\$1,550.00', 'color': Colors.blue},
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: assets.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final asset = assets[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: (asset['color'] as Color).withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    (asset['symbol'] as String)[0],
                    style: TextStyle(color: asset['color'] as Color, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(asset['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('${asset['balance']} ${asset['symbol']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
              Text(asset['value'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
        );
      },
    );
  }
}
