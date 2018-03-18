import { Controller, Get, Render } from "routing-controllers";

@Controller()
export class ContactController {
  @Get("/about")
  @Render("about")
  public index() {
    return { title: "关于" };
  }
}
