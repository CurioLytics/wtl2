'use client';

type Language = 'vi-VN' | 'en-US';

// Detect if running on iOS (Safari, Chrome, Edge all use WebKit on iOS)
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

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
    // Check for iOS specifically - Speech Recognition is NOT supported on iOS Safari/Chrome/Edge
    if (isIOS()) {
      onError('iOS không hỗ trợ ghi âm giọng nói trong trình duyệt. Vui lòng dùng thiết bị Android hoặc máy tính.');
      return;
    }

    if (!this.recognition) {
      onError('Trình duyệt không hỗ trợ ghi âm. Vui lòng dùng Chrome trên Android hoặc Chrome/Edge trên máy tính.');
      return;
    }

    if (!navigator.onLine) {
      onError('Cần kết nối internet để sử dụng tính năng này.');
      return;
    }

    // Check if running on HTTPS (required for mobile browsers)
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      onError('Cần HTTPS để sử dụng microphone trên điện thoại.');
      return;
    }

    // Request microphone permission explicitly before starting
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError('Trình duyệt không hỗ trợ truy cập microphone. Vui lòng dùng Chrome phiên bản mới nhất.');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed to get permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      
      // Check if this is the Android overlay permission issue
      const isAndroid = /android/i.test(navigator.userAgent);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        if (isAndroid) {
          // Android overlay permission issue - very common
          onError(
            'ANDROID: Vui lòng tắt các ứng dụng có overlay (bubble):\n' +
            '1. Messenger/Facebook chat heads\n' +
            '2. Screen filter/Blue light\n' +
            '3. Floating widgets\n' +
            '4. Hoặc vào Settings > Apps > Chrome > Permissions > Microphone > Allow'
          );
        } else {
          onError(`Từ chối quyền microphone. Vui lòng bấm vào biểu tượng khóa (🔒) trên thanh địa chỉ và bật quyền Microphone.`);
        }
      } else if (err.name === 'NotFoundError') {
        onError('Không tìm thấy microphone. Vui lòng kiểm tra microphone của thiết bị.');
      } else if (err.name === 'NotSupportedError' || err.name === 'TypeError') {
        onError('Trình duyệt không hỗ trợ hoặc cần HTTPS. Đảm bảo bạn đang dùng đường link HTTPS từ ngrok.');
      } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
        onError('Microphone đang được dùng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác và thử lại.');
      } else {
        onError(`Lỗi: ${err.name} - ${err.message}. Nếu thấy "close bubbles", vui lòng tắt Messenger chat heads và các overlay khác.`);
      }
      return;
    }

    // Set language if provided
    if (language) {
      this.recognition.lang = language;
    }

    this.recognition.onresult = (event: any) => {
      // Get the latest result
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      const text = result[0].transcript.trim();
      
      // Emit both interim and final results
      if (text) {
        onResult(text, result.isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      let errorMsg = 'Lỗi ghi âm';
      switch (event.error) {
        case 'no-speech':
          errorMsg = 'Không nghe thấy giọng nói. Vui lòng thử lại.';
          break;
        case 'audio-capture':
          errorMsg = 'Không thể truy cập microphone. Vui lòng kiểm tra cài đặt.';
          break;
        case 'not-allowed':
          errorMsg = 'Bạn đã từ chối quyền truy cập microphone. Vui lòng bật trong cài đặt trình duyệt.';
          break;
        case 'network':
          errorMsg = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
          break;
        case 'aborted':
          // User manually stopped - don't show error
          return;
        default:
          errorMsg = 'Lỗi ghi âm. Vui lòng thử lại.';
      }
      onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError('Please try again');
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
