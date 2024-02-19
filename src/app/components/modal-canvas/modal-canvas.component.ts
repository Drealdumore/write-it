import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { CommunicationService } from '../../services/communication.service';
import { TextService } from '../../services/text.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixDownload } from '@ng-icons/radix-icons';
import { FontService } from '../../services/font.service';

@Component({
  selector: 'modal-canvas',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './modal-canvas.component.html',
  styleUrl: './modal-canvas.component.scss',
  viewProviders: [provideIcons({ radixDownload })],
})
export class ModalCanvasComponent {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  loading = signal<boolean>(true);
  lineWidth: number = 400;
  padding: number = 10;

  data = signal('');
  userId = signal('');

  text: string = '';
  imgLink: string = '';

  canvasDataURL: string = '';

  private communicationService = inject(CommunicationService);
  private textService = inject(TextService);
  private router = inject(Router);

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;

    // Subscribe to text changes for text1
    this.textService.aiResponseText.subscribe((newText) => {
      this.text = newText;
      console.log(this.text);
      this.drawCanvas();
    });

  }

  drawCanvas() {
    if (this.ctx) {
      // Set basic text rendering properties
      this.ctx.font = `20px 'hwBlaire'`;

      // Clear the canvas before drawing
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // Calculate text width and positioning with padding
      const textWidth = this.ctx.measureText(this.text).width;
      const xPosition = this.padding; // Start text with padding from the left side

      // Break text into lines considering line width
      const words = this.text.split(' ');

      let currentLine = '';
      const lines: string[] = [];
      for (const word of words) {
        const measuredWidth = this.ctx.measureText(
          currentLine + ' ' + word
        ).width;
        if (measuredWidth > this.lineWidth) {
          lines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine += ' ' + word;
        }
      }
      lines.push(currentLine.trim());

      // Adjusted line spacing dynamically with added space between lines
      let cumulativeHeight = this.padding + 20;
      const extraSpace = 5;

      for (let i = 0; i < lines.length; i++) {
        const textMetrics = this.ctx.measureText(lines[i]);
        const lineHeight =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent;

        const yPosition = cumulativeHeight;
        // Adding extra space between lines
        cumulativeHeight += lineHeight + extraSpace;

        this.ctx.fillText(lines[i], xPosition, yPosition);
      }

      const canvas = this.canvas.nativeElement;
      this.canvasDataURL = canvas.toDataURL('image/png', 100.0);
      this.loading.set(false);
      // this.canvasDataURL = canvas.toDataURL();
    }
  }

  async downloadCanvas() {
    const canvas = this.canvas.nativeElement;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'write-it.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const blob = await fetch(dataURL).then((res) => res.blob());

    const url = this.communicationService.uploadImage(blob);

    // returns the id of the image
    this.data.set(this.communicationService.getData());
  }

  async uploadPhoto() {
    try {
      const canvasElement = this.canvas.nativeElement;

      // Convert canvas to data URL
      const dataURL = canvasElement.toDataURL('image/png');

      // Convert data URL to Blob
      const blob = await fetch(dataURL).then((res) => res.blob());

      const url = this.communicationService.uploadImage(blob);

      // returns the id of the image
      this.data.set(this.communicationService.getData());

      this.router.navigate([`/download/${this.data()}`]);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
}