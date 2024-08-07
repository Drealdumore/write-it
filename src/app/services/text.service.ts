import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  // private textSource = signal<string>(
  //   'This world is so quick to judge & too late to understand'
  // );
  // currentText = this.textSource.toObservable;

  // private text2Source = signal<string>('- Saint');
  // currentText2 = this.text2Source.toObservable;

  private textSource = new BehaviorSubject<string>(
    'This world is so quick to judge & too late to understand'
  );
  currentText = this.textSource.asObservable();

  private text2Source = new BehaviorSubject<string>('- Saint');
  currentText2 = this.text2Source.asObservable();

  private aiResponse = new BehaviorSubject<string>(
    ' "Love is not a passion but a deep, abiding affection. It is not a momentary excitement, but a quiet and enduring devotion." - Helen Keller'
  );
  aiResponseText = this.aiResponse.asObservable();

  changeText(newText: string) {
    // this.textSource.set(newText);
    this.textSource.next(newText);
  }

  changeText2(newText: string) {
    // this.text2Source.set(newText);
    this.text2Source.next(newText);
  }

  changeAiText(newText: string) {
    this.aiResponse.next(newText);
  }
}
