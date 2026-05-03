import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(32),
              ),
              child: Icon(
                Icons.shield_outlined,
                size: 80,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Thalexa',
              style: TextStyle(
                fontSize: 42,
                fontWeight: FontWeight.bold,
                fontFamily: 'Display',
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Secure Web3 verification, escrow, and cross-border payments.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey,
                fontSize: 16,
              ),
            ),
            const Spacer(),
            ElevatedButton.icon(
              onPressed: () {
                // TODO: Implement Web3Auth login
                context.go('/');
              },
              icon: const FaIcon(FontAwesomeIcons.google, size: 20),
              label: const Text('Continue with Google'),
            ),
            const SizedBox(height: 16),
            const Text(
              'By continuing, you agree to our Terms of Service.',
              style: TextStyle(fontSize: 10, color: Colors.grey),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
