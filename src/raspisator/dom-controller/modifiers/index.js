import Wall from "./wall";

class Modifiers {
  constructor(rs) {
    this.rs = rs;
    this.wall = new Wall(rs);
  }
}

export default Modifiers;
