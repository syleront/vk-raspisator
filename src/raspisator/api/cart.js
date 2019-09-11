class Cart {
  constructor(interval) {
    this.cart = [];

    const { cart } = this;
    setInterval(() => {
      if (cart.length) {
        const [call, resolve, reject] = cart.shift();
        call().then(resolve).catch(reject);
      }
    }, interval || 334);
  }

  addToQueue(f, resolve, reject) {
    this.cart.push([f, resolve, reject]);
  }
}

export default Cart;
