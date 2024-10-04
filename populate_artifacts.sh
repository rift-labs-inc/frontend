# Helper script to compile contract artifacts and move them to artifacts/ dir 
cd contracts/ && forge compile && cd ..
rm -rf artifacts/*
mv contracts/out/RiftExchange.sol/RiftExchange.json src/abis/RiftExchange.json
cd data-aggregation-contracts/ && forge compile && cd ..
mv data-aggregation-contracts/out/DepositVaultsAggregator.sol/DepositVaultsAggregator.json src/abis/DepositVaultsAggregator.json
mv data-aggregation-contracts/out/SwapReservationsAggregator.sol/SwapReservationsAggregator.json src/abis/SwapReservationsAggregator.json
