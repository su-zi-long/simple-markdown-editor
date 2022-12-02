import { defaultConfiguration } from "./constant/defaultConfiguration";
import { IOptions } from "./interface/IOptions";
import { Event } from "./modules/event/Event";
import { Render } from "./modules/render/Render";
import { Interaction } from "./modules/interaction/Interaction";
import { OpenAPI } from "./modules/openAPI/openAPI";

/**
 * 编辑器核心类
 * 1. 负责处理传入的参数
 * 2. 负责加载各个模块类
 */
export class Editor {
  public readonly options: IOptions;
  public readonly event: Event;
  public readonly render: Render;
  public readonly interaction: Interaction;
  public readonly openAPI: OpenAPI;

  constructor(options: IOptions) {
    this.options = this.mergeConfiguration(options, defaultConfiguration);

    this.event = new Event();
    this.render = new Render(this);
    this.interaction = new Interaction(this);
    
    this.render.render();
    
    this.openAPI = new OpenAPI(this);
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
