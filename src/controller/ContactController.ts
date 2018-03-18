import { Controller, Get, Render } from "routing-controllers";

@Controller()
export class ContactController {
  @Get("/contact")
  @Render("contact")
  public index() {
    return { title: "联系我" };
  }
}
