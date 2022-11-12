import { defaultConfiguration } from "./constant/defaultConfiguration";
import { IOptions } from "./interface/IOptions";
import { Render } from "./modules/render/Render";

export class Editor {
  public readonly options: IOptions;

  public readonly render: Render;

  constructor(options: IOptions) {
    this.options = this.mergeConfiguration(options, defaultConfiguration);

    this.render = new Render(this);
  }

  private mergeConfiguration(
    options: IOptions,
    defaultConfiguration: IOptions
  ) {
    return {
      ...options,
      ...defaultConfiguration,
    };
  }
}
