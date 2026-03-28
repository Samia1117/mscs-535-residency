// Step 1: You reach out to the website
class SecureOnlineCommunication {

    void connect(String websiteAddress) {

        // 1. Agree on the communication protocol 
        sendToServer("Hello! I'd like to connect securely.");
        // 2. Receive digital certificate from remote server
        Certificate cert = receiveFromServer();

        // 3. Check certificate is: 
        // i) issued by a trusted certificate authority 
        // ii) for the website we are trying to access
        // iii) not expired. 
        if (!isTrustedAuthority(cert.issuer))   abort("Don't trust this site");
        if (!cert.name.equals(websiteAddress))  abort("Wrong site — possible impostor");
        if (cert.isExpired())                   abort("Certificate expired");

        // 4. Key Exchange: create a shared secret (symmetric encryption key)
        // Enables fast encryption of data during a session
        Number myRandom    = generateRandom();
        Number theirRandom = exchangeWith(server, myRandom);
        SecretKey sharedKey = combine(myRandom, theirRandom);
        // Both sides run combine() and arrive at the same key 

        // 5. Connection is now considered secure, so use the shared secret to encrypt the bank password
        // A man in the middle cannot:
        // i) decrypt the encrypted message (only the trusted server whose certificate we trusted earlier can)
        // ii) tamper with the message without the trusted server knowing
        // iii) replace the encrypted message with its own malicious message because the MITM does not have
        // the shared secret that only the client and trusted server has
        /// iv) replay the message (in a replay attack) 
        sendSecurely(sharedKey, "Hello, bank! My password is 1234");
    }


    // Send a message securely - encrypted, with tamper stamp and a messageCount to ensure:
    // message cannot be decrypted, tampered with, or replayed by an MITM!
    void sendSecurely(SecretKey key, String message) {
        String scrambled    = encrypt(message, key);
        String tamperStamp  = sign(scrambled, key);
        int    messageCount = nextMessageNumber();

        send(scrambled, tamperStamp, messageCount);
    }


    // Receive a message securely 
    // i) If incoming message number is not the same as the expect message number, 
    // recognize it as a replay attack and abort the communication
    // ii) If message was tampered with, abort the communication
    String receiveSecurely(SecretKey key, Packet incoming) {
        if (incoming.number != expectedNumber)  abort("Possible replay attack");
        if (!verifyStamp(incoming, key))        abort("Message was tampered with");

        return decrypt(incoming.scrambled, key);
    }

    // Close the connection and delete any secret generated for the session!
    void disconnect(SecretKey key) {
        send("Goodbye!");
        erase(key);  // Delete the secret — old messages stay safe
    }
}