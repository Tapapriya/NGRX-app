import { NgModule } from "@angular/core";

import { ReactiveFormsModule } from "@angular/forms";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { SharedModule } from "../shared/shared.module";

import { AuthRoutingModule } from "./auth-routing.module";

@NgModule({
  declarations: [
    SignupComponent,
    LoginComponent,
  ],
imports: [
  ReactiveFormsModule,
  SharedModule,
  AuthRoutingModule
]
})
export class AuthModule {}
