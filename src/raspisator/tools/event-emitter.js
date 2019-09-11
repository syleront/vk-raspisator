function Events() {
  const events = [];

  this.emit = (name, data) => {
    events.forEach((e) => {
      if (e.name === name) {
        e._cb(data);
      }
    });
  };

  this.on = (name, _cb) => {
    events.push({ name, _cb });
  };
}

export default Events;
