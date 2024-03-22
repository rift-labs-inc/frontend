library TestLib {
    struct ProposedBlock {
        uint256 checkpoint_height;
        bytes32 block_hash;
        uint32 version;
        bytes32 prev_block_hash;
        bytes32 merkle_root;
        uint32 timestamp;
        uint32 bits;
        uint32 nonce;
        bytes proof;
    }

    function getTestBlocks() internal returns (ProposedBlock[] memory blocks) {
        blocks = new ProposedBlock[](2);
        blocks[0] = ProposedBlock({
            checkpoint_height: 834624,
            block_hash: 0x000000000000000000032366f4bd696122c3e11096dfdacaf76b428b2a3f2318,
            version: 571998208,
            prev_block_hash: 0x0000000000000000000350156217f3a450f8994e7054b631db2f0e07f43f268d,
            merkle_root: 0x8783077ac35fec61ecf6fa00884b8ab7c72f6960ee38143b389d0a4411cd9cf7,
            timestamp: 1710397689,
            bits: 386095705,
            nonce: 1263049047,
            proof: hex"00"
        });
        blocks[1] = ProposedBlock({
            checkpoint_height: 834625,
            block_hash: 0x0000000000000000000106c4080f28bebabecec765e187c495f1197772d2cc83,
            version: 537206784,
            prev_block_hash: 0x000000000000000000032366f4bd696122c3e11096dfdacaf76b428b2a3f2318,
            merkle_root: 0xe92d1d9eb211f2921bc17a1b4fa9ae3b0187404159afea3559418ec32d7c662e,
            timestamp: 1710397878,
            bits: 386095705,
            nonce: 4170401636,
            proof: hex"227305794a2ccf322291c66bb6325297a28d23e2a1cffbbc93969d714bd59cdd0652ccb41bd8ccd9f7b5f97cdac669f6423f384428bc836b228f7c82b3d0d55b07490305cb6b3f0aeb8312661a7a71ec8dd8fb842134884f49036408f99584f1030b701e671781282c382d0a45327a748123dd2913b1b85187011d557a7e4f1b0696f9bfc03a641af07211a524bcafcbf15a08b91d8d8d5c43316ffca41efd8828f5aeeae26a7598ad97ba444df5b679908af26ba3804b67c4b594ef514cb2ca1ca68c809b19af7bd6094fcdec5e6772eeb5aacee46d11974a2deab259b3ced3184e79d8dac53c7463943d7fe27f336741ef8b67fff89b4972e21a77b998b4e4092b43c4789e3f70253eefaa779b8743caee999f7c579682d37758480e124cfe21fe58ac30c6c92dfee0cfb0e5224d458ecb8c3f81b32596a037fe4473d613000c337b0ef0a5e1373e903e1c336e7f37e84dee0360fb2d03e8906e120a14e1e71048feab66af011658a5e2ffb532d2f5f26b0ed925a309c9a2a3ddda18c970fa1dfd4e98ccf09416919975586ebdc78a03504ab3a1a7e3c8487e755136f2c416265c405d6bba4ffe75902c1a5df94a2e401fd3f3d3fe116453553212ba5a716b2bb23a1e2d75fd70a2a0ab514f9dfb765737001dcdac27fb20fe46d86bd8215619a76ed7fb713aab389ebb8e7960c60ec328e7cc3c1da59581cbd08547b236bd21dc9c85941cfbbd7bdd847069c2d948a0bc8284601adfe1fa1a8e199b4a67720c6a03af50eccc8dbdb20ff296256c1933ea551167f620f6191ad3ae2d52247a04c9e372c154813bb68fdcc48fe5c6637cc857410513f4ebb63fdef5445c25382fa37ea88930e403e046d70ace085f8f0688c9100394274381f205bad538acad16d4a61a3e8ae7147f89b4ef2a097bdc6fa08cf3ee58d7960fbc0b0f3364b06328d956f631e85b9c3b7bdea3d2bb56a3e5232ef4e6fa808b0035679318cc388b10e90d8d22a0524a6d7a9eda8670dfd293469362c9eb6fe15dca7670db35afde0bba9c295ca2a3ca18dcbfed612dfa8c4d4e15882dda7f2303e3216313180b6d0dcbf5f97bfdb1f7d626c8fe24dd51a615e19b3d694092b6da39695789c2c6c20c6204adf4492012e7b2d1d3b3afb6272a8a1afb2a66d6608688241ae77a7a340768e72451f92e4abb3a0b66b765d305c87f38c338ffe020f8ddeca8b7fe8c031b61714f553c42d34d7a55d567fcdf887ec48a48d62720b7e3509e0b2499d5cc0e0266d50682e4f2a2fbadb2ad1b239b417887f3aa4ec2a84dfd89b22b76b1582d3d4a10198db5391afaa2006ae3aec88b65ba28c85272418a2613ea7e29ac0211e578f970e30bf51ff11da0288e0ebb0c29a53abf34c1b227493c0c2735f0a009ae048d8d3833b76a3134659092bcc5c541c84c34318bd3722556d5704817752959ecdaec11fe147be79e5ca55c0eb527b86c327cf716ad8c6c67ffb42489ae1b1601947dd078828e232f8c041d4175574af6683253e043f5faa7f45e04f6b522c2fac5c2501e98711bdcea896ed220e8921c70b347baeb441f29810739d81d083096b27491792ee2bc68709590a632b479d2702be4143e61eb1dd1d4b8d10b0918957f0645dfdcab23554963f635be8002d3aacfbfb11aef9241ebcdbf9a610277abcfb84c9848b0a7f95a902f2bf5b5fe1694871778bd0d967dc5586b8c2612df4ad4344933ece5472c4c20b4dc8565d64a1285c9abad25b9a4b740777f470923560ad6a473fac21a12d0bd86c3eff087508d31134da30dcf570108cc2e922efca064c2027cacd8f454a2022e9713ee4b01bfaec65c4954272891982079770fae66713fa23079612457803af456c0c70432bb08d4461dcc2c1e286435194d165dd0853c55bc21ac937d0eb2349e8a868e7221c06eda9f824dda2bbd025f1c01b24f5a1024675b541ae9470c770770060273a126207b8b711318c3937fec700b9a5b299eabdbf0e75033b70aad09a7bad6209f3329a418e0929807a82cfd3b0ebd015efd00fcc53bdcc7c0e02c26861e3dd3eb8ecae7357a8676def5631966054eb4ef7dd100f6f21aa9e9310863379cf25e8be32b0bafefd87e95575e733e2702d7771a1ec38b01027fcabde165595f342562581efed89fccda295b181a032774a6d6685305234eb7463078fb9186d6f8489a55fce4cf7dc4ec4d91cb193c0c3f9915ac6c0ef066c736b0089dd9e328d35f5978da0bfc7151c237c4fd6ee51675591c863f6b382a00bea0e4dc89965f5ed6835d632dc9b385ca9b7c574aa21b9e86bd28a2e44dbf8292790c371e2d8bc9bdfff51066bb2d6b7810e1a2229d2efd309669d8e6b526bae2d0f623a8dc0c6057259c99bf978617cbbdfb95fe552282d43f8afb09bd04b33a67c0262bd8b31ef2b245668f595df21701175915a91068fc3ee9061b055bd4e2e067f0b81861bc3aea93f8921b1002f79943c61ea317afad05ed9d4fc9e57c03e0fdaaaf2f3d0d16f25511ed0686a14b3b05d943bf0f8af012815031e91ad3db48fe7908df308882292c50030f43be090e57e34eed1d0b2c38a8d3aa4b3f8a4c7600d4727268d72d45c72e4d9c7b861acc05d401142fe9b04ee3a958db7c8e752d29d852acb8c4bdc59d17efb1369b6994ef68c09c1636e455ef4fb2ec6f5e4c79aea8cd6afb86601e1232046c2af4c0a330582516070230fe8b6ffc8d9847ca9858c86a1f2d8c34b5d912bc1041ccaddc48a9d7aa02bfef41479c154b699128ada5bb6ba307344d4665cd87531aaddcc7c87d5cef0cd3bd81ccef7f7b2625af3235df75d633d269d26209d9203245fa659f97a7ac1292db128ee053395e65bc68df56faefde233e029cb68983e73350bb25608ca42d70e4f66af32ddf29c2f7c99dfe73e2ba8c739d56c21b50882576a88955be7a195458cd380aaab1adcaaf49b7bb66f4e37ff49a2d1e0f3687ad2982005213a008ad50cf04620218d9f0f0d16aa5a80f9ec749c0559536a7fd313e9c5260503b"
        });
    }
}
