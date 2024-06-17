Audio fix is in script.js file line 77

This change fixes audio issue:
 audio: { channels: 2, autoGainControl: false, echoCancellation: false, noiseSuppression: false }});

 If comment the line 77 and uncomment line 76 with defult setting, audio will behave the same way as on the Pod.



# Setup https:
1. npm install mkcert -g
2. mkcert create-ca
3. mkcert create-cert
4. OPTIONAL: to run it locally, update the files with your local IP

on AWS ec2 instance:

sudo yum update -y
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

sudo yum install git -y

git clone https://github.com/mygit
 cd webrtc-starter/


npm install

nano scripts.js > set publick IP or elastic IP address of the EC2 instance

sudo npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

in web browser make sure you put https://IP:8181
