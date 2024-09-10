# Helper script to compile contract artifacts and move them to artifacts/ dir 
cd contracts/ && forge compile && cd ..
rm -rf artifacts/*
mv contracts/out/RiftExchange.sol/RiftExchange.json src/abis/RiftExchange.json
