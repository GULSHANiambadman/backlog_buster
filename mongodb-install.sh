#!/bin/bash
# MongoDB Installation Script for Fedora 43

echo "Setting up MongoDB official repository..."

# Create MongoDB repository file for Fedora/RHEL 9 compatible systems
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

echo "Installing MongoDB..."
sudo dnf install -y mongodb-org

echo "Starting MongoDB service..."
sudo systemctl start mongod

echo "Enabling MongoDB to start on boot..."
sudo systemctl enable mongod

echo "Checking MongoDB status..."
sudo systemctl status mongod

echo ""
echo "MongoDB installation complete!"
echo "You can verify the connection with: mongosh"
