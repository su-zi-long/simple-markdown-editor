import { defaultConfiguration } from "./constant/defaultConfiguration";
import { IOptions } from "./interface/IOptions";
import { Event } from "./modules/event/Event";
import { Interaction } from "./modules/interaction/Interaction";
import { Render } from "./modules/render/Render";

export class Editor {
  public readonly options: IOptions;

  public readonly event: Event;
  public readonly render: Render;
  public readonly interaction: Interaction;

  constructor(options: IOptions) {
    this.options = this.mergeConfiguration(options, defaultConfiguration);

    this.event = new Event();
    this.render = new Render(this);
    this.interaction = new Interaction(this);
  }

  private mergeConfiguration(
    options: IOptions,
    defaultConfiguration: IOptions
  ) {
    return {
      ...defaultConfiguration,
      ...options,
    };
  }
}
