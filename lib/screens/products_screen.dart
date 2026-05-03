import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProductsScreen extends ConsumerWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verified Products')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: const Text('Register Product'),
        icon: const Icon(Icons.add),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            _buildVerifyBar(context),
            const SizedBox(height: 32),
            _buildProductList(),
          ],
        ),
      ),
    );
  }

  Widget _buildVerifyBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          const Icon(Icons.search, color: Colors.grey),
          const SizedBox(width: 12),
          const Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Enter Product Code (e.g. GG_THLX_...)',
                border: InputBorder.none,
                hintStyle: TextStyle(fontSize: 14),
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(80, 40),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            child: const Text('Verify'),
          ),
        ],
      ),
    );
  }

  Widget _buildProductList() {
    return Column(
      children: List.generate(3, (index) => _buildProductItem()),
    );
  }

  Widget _buildProductItem() {
    return Container(
      margin: const EdgeInsets.bottom(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.inventory_2, color: Colors.blue),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Luxury Watch X1', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('GG_THLX_000042', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
              const Chip(
                label: Text('AUTHENTIC', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                backgroundColor: Color(0xFF00FF85),
                labelStyle: TextStyle(color: Colors.black),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
