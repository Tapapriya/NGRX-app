import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Subscription } from "rxjs";
import { Exercise } from "./exercise.model";
import { map, take } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { UIService } from "../shared/ui-service";
import * as UI from '../shared/ui.actions';
import * as fromTraining from './training.reducer';
import * as Training from './training.actions';

@Injectable({ providedIn: "root" })
export class TrainingService {
  private fbSubs: Subscription[] = [];

  constructor(
    private db: AngularFirestore, private UIService: UIService,
    private store: Store<fromTraining.State>) { }

  fetchAvailableExercise() {
    this.store.dispatch(new UI.StartLoading);
    this.fbSubs.push(this.db.collection('availabeExercises').snapshotChanges().pipe(
      map((docArray) => {
        // throw( new Error())
        return docArray.map((doc) => {
          return {
            id: doc.payload.doc.id,
            ...(doc.payload.doc.data() as Exercise)
          };
        });
      })
    )
    .subscribe((exercises: Exercise[]) => {
      this.store.dispatch(new UI.StopLoading);
        this.store.dispatch(new Training.SetAvailableTrainings(exercises))
      },
    error => {
      this.store.dispatch(new UI.StopLoading);
        this.UIService.showSnackBar('Fetching Exercises failed, please try again later', null, 3000);
      }))
  }

  startExercise(selectedId: string) {
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.addDataToDatabse({
        ...ex,
        date: new Date(),
        state: "completed"
      });
      this.store.dispatch(new Training.StopTraining());
    });
  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.addDataToDatabse({
        ...ex,
        duration: ex.duration * (progress / 100),
      calories: ex.calories * (progress / 100),
        date: new Date(),
        state: "cancalled"
      });
      this.store.dispatch(new Training.StopTraining());
    });
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.db.collection('finishedExercises').valueChanges().subscribe((exercises: Exercise[]) => {
      this.store.dispatch(new Training.SetFinishedTrainings(exercises));
    }))
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabse(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise)
  }
}
