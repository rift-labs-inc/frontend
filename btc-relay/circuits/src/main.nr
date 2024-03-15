fn main(x: Field, y: pub Field) {
    assert(x != y);
}

#[test]
fn test_main() {
    main(1, 2);

    // Uncomment to make test fail
    // main(1, 1);
	// Test block: https://blockchain.info/rawblock/0000000000000bae09a7a393a8acded75aa67e46cb81f7acaa5ad94f9eacd103
}
