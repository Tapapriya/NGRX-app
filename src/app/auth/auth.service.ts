import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";

import { UIService } from "../shared/ui-service";
import { TrainingService } from "../training/training.service";
import { AuthData } from "./auth-data.model";

import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';
import * as Auth from './auth.actions';



@Injectable({ providedIn: "root" })
export class AuthService {

  constructor(private router: Router,
    private afAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private UIService: UIService,
    private store: Store<fromRoot.State>
  ) { }

  initAuthListener() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.store.dispatch(new Auth.SetAuthenticated())
        this.router.navigate(['/training']);
      } else {
        this.trainingService.cancelSubscriptions();
        this.store.dispatch(new Auth.SetUnauthenticated())
        this.router.navigate(['/login']);
      }
    })
  }

  registerUser(authData: AuthData) {
    // this.UIService.loadingStatechanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.afAuth.createUserWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        // this.UIService.loadingStatechanged.next(false);
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        // this.UIService.loadingStatechanged.next(false);
        this.store.dispatch(new UI.StopLoading());
        this.UIService.showSnackBar(error.message, null, 3000)
      });
  }

  login(authData: AuthData) {
    // this.UIService.loadingStatechanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.afAuth.signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        // this.UIService.loadingStatechanged.next(false);
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        // this.UIService.loadingStatechanged.next(false);
        this.store.dispatch(new UI.StopLoading());
        this.UIService.showSnackBar(error.message, null, 3000)
      });
  }

  logout() {
    this.afAuth.signOut();
  }

}
