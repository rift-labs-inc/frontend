# Helper script to compile contract artifacts and move them to artifacts/ dir 
git submodule update --init --remote
(cd protocol/contracts && forge soldeer install && forge compile)
(cd protocol/data-aggregation-contracts && forge compile)
rm -rf artifacts/*
cp protocol/contracts/out/RiftExchange.sol/RiftExchange.json src/abis/
cp protocol/data-aggregation-contracts/out/DepositVaultsAggregator.sol/DepositVaultsAggregator.json src/abis/
cp protocol/data-aggregation-contracts/out/SwapReservationsAggregator.sol/SwapReservationsAggregator.json src/abis/
