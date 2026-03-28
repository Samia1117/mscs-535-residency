# Project 4 - Secure Online Communication System

## Assignment Instructions

Provide and describe a pseudocode for secure online communication system:

1. Using secure communication with TLS
2. That protects against man-in-the-middle (MITM) attacks

## Implementation Overview

The `SecureOnlineCommunication.java` file provides a pseudocode implementation of a TLS-like secure communication protocol that demonstrates how modern secure online communication works and protects against various attacks.

### How It Works

#### 1. **Initial Connection & Certificate Validation**
When establishing a connection (`connect()` method), the system:
- Initiates a secure connection request to the server
- Receives a digital certificate from the server
- Validates the certificate by checking three critical conditions:
  - **Trusted Authority**: Ensures the certificate is issued by a trusted Certificate Authority (CA)
  - **Domain Verification**: Confirms the certificate matches the intended website address (prevents impersonation)
  - **Validity Period**: Verifies the certificate hasn't expired

This three-step validation is crucial for preventing MITM attacks, as an attacker cannot forge a certificate signed by a trusted CA.

#### 2. **Secure Key Exchange**
After certificate validation, the system establishes a shared secret key:
- Both client and server generate random numbers
- These random numbers are exchanged and combined using a cryptographic key derivation function
- Both parties independently compute the same symmetric encryption key (shared secret)
- This key is used for fast, efficient encryption during the session

This mimics the Diffie-Hellman key exchange used in TLS, ensuring that even if an attacker intercepts the exchange, they cannot derive the shared secret.

#### 3. **Secure Message Transmission**
The `sendSecurely()` method implements multiple layers of protection:
- **Encryption**: Messages are encrypted using the shared secret key (confidentiality)
- **Tamper Stamp (MAC)**: A cryptographic signature is generated to detect any modifications (integrity)
- **Message Counter**: Each message includes a sequence number to prevent replay attacks (freshness)

#### 4. **Secure Message Reception**
The `receiveSecurely()` method validates incoming messages:
- **Replay Attack Prevention**: Checks if the message number matches the expected sequence number
- **Integrity Verification**: Validates the tamper stamp to ensure the message wasn't modified
- **Decryption**: Only after validation, decrypts the message using the shared secret key

#### 5. **Secure Disconnection**
The `disconnect()` method ensures proper cleanup:
- Sends a goodbye message to the server
- **Erases the session key** from memory, providing forward secrecy
- Even if the key is compromised later, past messages remain secure

### Security Features

This implementation protects against multiple attack vectors:

| Attack Type | Protection Mechanism |
|-------------|---------------------|
| **Man-in-the-Middle (MITM)** | Certificate validation ensures communication only with authenticated server |
| **Message Decryption** | Strong symmetric encryption with shared secret unknown to attackers |
| **Message Tampering** | Cryptographic signatures (tamper stamps) detect any modifications |
| **Message Replay** | Sequence numbers prevent old messages from being resent |
| **Impersonation** | Domain verification in certificate prevents attackers from pretending to be the legitimate server |
| **Certificate Forgery** | Trust chain validation through Certificate Authorities |

### Key Concepts Demonstrated

- **Hybrid Encryption**: Uses asymmetric cryptography (certificates/public keys) for authentication and symmetric encryption (shared secret) for efficient data encryption
- **Defense in Depth**: Multiple layers of security (authentication, encryption, integrity, freshness)
- **Forward Secrecy**: Deleting session keys ensures past communications remain secure even if future keys are compromised
- **TLS Handshake Simulation**: Mirrors the real-world TLS protocol used in HTTPS connections

## Code Structure

The implementation consists of four main methods:

1. **`connect(String websiteAddress)`** - Establishes secure connection with certificate validation and key exchange
2. **`sendSecurely(SecretKey key, String message)`** - Encrypts and sends messages with integrity protection
3. **`receiveSecurely(SecretKey key, Packet incoming)`** - Receives and validates encrypted messages
4. **`disconnect(SecretKey key)`** - Cleanly terminates the connection and erases session keys

## Real-World Applications

This pseudocode demonstrates the core principles used in:
- **HTTPS** connections for secure web browsing
- **Secure email** protocols (TLS/SSL for SMTP, IMAP, POP3)
- **VPN** connections
- **Secure messaging** applications
- **Online banking** and e-commerce transactions

