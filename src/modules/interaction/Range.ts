import { Interaction } from "./Interaction";

export class Range {
  private interaction: Interaction;

  private startIndexes: number[];
  private endIndexes: number[];

  constructor(interaction: Interaction) {
    this.interaction = interaction;
  }

  public setIndexes(indexes1: number[], indexes2: number[]) {
    let exchange = false;
    for (let i = 0; i < indexes1.length; i++) {
      const index1 = indexes1[i];
      const index2 = indexes2[i];
      if (index1 > index2) {
        exchange = true;
        break;
      }
    }

    if (exchange) {
      this.startIndexes = indexes2;
      this.endIndexes = indexes1;
    } else {
      this.startIndexes = indexes1;
      this.endIndexes = indexes2;
    }

    console.log("rangeIndex", this.startIndexes, this.endIndexes);
  }

  public getIndexes() {
    return {
      startIndexes: this.startIndexes,
      endIndexes: this.endIndexes,
    };
  }

  public hasRange() {
    return this.startIndexes[0] >= 0 && this.endIndexes[0] >= 0;
  }
}
