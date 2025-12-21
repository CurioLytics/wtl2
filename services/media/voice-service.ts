'use client';

type Language = 'vi-VN' | 'en-US';

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: Language = 'en-US';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
      }
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  async startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language?: Language
  ) {
    if (!this.recognition) {
      onError('Trình duyệt không hỗ trợ ghi âm. Vui lòng dùng Chrome hoặc Edge (máy tính/Android) hoặc Safari (iOS).');
      return;
    }

    if (!navigator.onLine) {
      onError('Cần kết nối internet để sử dụng tính năng này.');
      return;
    }

    // Set language if provided
    if (language) {
      this.recognition.lang = language;
    }

    this.recognition.onresult = (event: any) => {
      let fullTranscript = '';

      // Loop through only the new results added in this event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        fullTranscript += transcript + ' ';
      }

      const text = fullTranscript.trim();
      const lastResultIndex = event.results.length - 1;
      const isFinal = event.results[lastResultIndex].isFinal;

      if (text) {
        onResult(text, isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      // Logic for providing more specific error messages
      let errorMsg = `Lỗi ghi âm: ${event.error}`;

      switch (event.error) {
        case 'no-speech':
          errorMsg = 'Không nghe thấy giọng nói. Vui lòng thử lại.';
          break;
        case 'audio-capture':
          errorMsg = 'Không thể truy cập microphone. Vui lòng kiểm tra cài đặt thiết bị.';
          break;
        case 'not-allowed':
          errorMsg = 'Bạn đã từ chối quyền truy cập microphone. Vui lòng bật trong cài đặt trình duyệt.';
          break;
        case 'network':
          errorMsg = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
          break;
        case 'aborted':
          return; // User manually stopped - don't show error
        case 'service-not-allowed':
          errorMsg = 'Dịch vụ ghi âm không khả dụng. Kiểm tra kết nối HTTPS hoặc cài đặt hệ thống.';
          break;
      }

      console.error('Speech Recognition Error:', event);
      onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error: any) {
      console.error('Speech Recognition start error:', error);
      onError(`Không thể bắt đầu ghi âm: ${error.message || error.toString()}`);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }
}

export const voiceService = new VoiceService();
