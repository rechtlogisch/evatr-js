/**
 * Tests for TypeScript types and interfaces
 */

import {
  ApiStatusMessage,
  ApiEUMemberState,
  EvatrClientConfig,
  EUMemberState,
  QualifiedResultCode,
  QualifiedRequest,
  Request,
  Response,
  SimpleRequest,
  StatusMessage,
} from './types';

describe('TypeScript Types', () => {
  describe('ApiRequest', () => {
    it('should accept valid simple request', () => {
      const request: SimpleRequest = {
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      };

      expect(request.vatIdOwn).toBe('DE123456789');
      expect(request.vatIdForeign).toBe('ATU12345678');
    });

    it('should accept valid qualified request', () => {
      const request: QualifiedRequest = {
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Test Company',
        street: 'Test Street 123',
        zip: '1010',
        location: 'Vienna',
      };

      expect(request.company).toBe('Test Company');
      expect(request.location).toBe('Vienna');
    });
  });

  describe('ApiResponse', () => {
    it('should accept valid response', () => {
      const response: Response = {
        id: 'test-id',
        timestamp: '2025-08-03T20:30:00Z',
        status: 'evatr-0000',
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      };

      expect(response.timestamp).toBe('2025-08-03T20:30:00Z');
      expect(response.status).toBe('evatr-0000');
      expect(response.vatIdOwn).toBe('DE123456789');
      expect(response.vatIdForeign).toBe('ATU12345678');
    });

    it('should accept response with validation results', () => {
      const response: Response = {
        id: 'test-id',
        timestamp: '2025-08-03T20:30:00Z',
        status: 'evatr-0000',
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'A',
        street: 'B',
        zip: 'C',
        location: 'D',
      };

      expect(response.vatIdOwn).toBe('DE123456789');
      expect(response.vatIdForeign).toBe('ATU12345678');
      expect(response.company).toBe('A');
      expect(response.street).toBe('B');
      expect(response.zip).toBe('C');
      expect(response.location).toBe('D');
    });

    it('should accept response with validity dates', () => {
      const response: Response = {
        id: 'test-id',
        timestamp: '2025-08-03T20:30:00Z',
        status: 'evatr-2002',
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        validFrom: '2025-09-01',
        validTill: '2025-12-31',
      };

      expect(response.validFrom).toBe('2025-09-01');
      expect(response.validTill).toBe('2025-12-31');
      expect(response.vatIdOwn).toBe('DE123456789');
      expect(response.vatIdForeign).toBe('ATU12345678');
    });
  });

  describe('EvatrClientConfig', () => {
    it('should accept empty config', () => {
      const config: EvatrClientConfig = {};
      expect(config).toEqual({});
    });

    it('should accept partial config', () => {
      const config: EvatrClientConfig = {
        timeout: 5000,
      };
      expect(config.timeout).toBe(5000);
    });

    it('should accept full config', () => {
      const config: EvatrClientConfig = {
        timeout: 10000,
        headers: {
          'Custom-Header': 'value',
          'Another-Header': 'another-value',
        },
      };

      expect(config.timeout).toBe(10000);
      expect(config.headers).toEqual({
        'Custom-Header': 'value',
        'Another-Header': 'another-value',
      });
    });
  });

  describe('ApiStatusMessage', () => {
    it('should accept valid status message', () => {
      const statusMessage: ApiStatusMessage = {
        status: 'evatr-0000',
        kategorie: 'Ergebnis',
        httpcode: 200,
        meldung: 'Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig.',
      };

      expect(statusMessage.status).toBe('evatr-0000');
      expect(statusMessage.kategorie).toBe('Ergebnis');
      expect(statusMessage.httpcode).toBe(200);
    });

    it('should accept status message with field', () => {
      const statusMessage: ApiStatusMessage = {
        status: 'evatr-0004',
        kategorie: 'Fehler',
        httpcode: 400,
        feld: 'anfragendeUstid',
        meldung: 'Die anfragende DE Ust-IdNr. ist syntaktisch falsch.',
      };

      expect(statusMessage.feld).toBe('anfragendeUstid');
    });

    it('should only accept valid categories', () => {
      const validCategories: Array<ApiStatusMessage['kategorie']> = [
        'Ergebnis',
        'Hinweis',
        'Fehler',
      ];

      validCategories.forEach((kategorie) => {
        const statusMessage: ApiStatusMessage = {
          status: 'test',
          kategorie,
          httpcode: 200,
          meldung: 'test',
        };
        expect(statusMessage.kategorie).toBe(kategorie);
      });
    });
  });

  describe('StatusMessage', () => {
    it('should accept valid status message', () => {
      const statusMessage: StatusMessage = {
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig.',
      };

      expect(statusMessage.status).toBe('evatr-0000');
      expect(statusMessage.category).toBe('Result');
      expect(statusMessage.http).toBe(200);
    });

    it('should accept status message with field', () => {
      const statusMessage: StatusMessage = {
        status: 'evatr-0004',
        category: 'Error',
        http: 400,
        field: 'anfragendeUstid',
        message: 'Die anfragende DE Ust-IdNr. ist syntaktisch falsch.',
      };

      expect(statusMessage.field).toBe('anfragendeUstid');
    });

    it('should only accept valid categories', () => {
      const validCategories: Array<StatusMessage['category']> = ['Result', 'Hint', 'Error'];

      validCategories.forEach((category) => {
        const statusMessage: StatusMessage = {
          status: 'test',
          category,
          http: 200,
          message: 'test',
        };
        expect(statusMessage.category).toBe(category);
      });
    });
  });

  describe('ApiEUMemberState', () => {
    it('should accept valid member state', () => {
      const memberState: ApiEUMemberState = {
        alpha2: 'DE',
        name: 'Germany',
        verfuegbar: true,
      };

      expect(memberState.alpha2).toBe('DE');
      expect(memberState.name).toBe('Germany');
      expect(memberState.verfuegbar).toBe(true);
    });

    it('should accept unavailable member state', () => {
      const memberState: ApiEUMemberState = {
        alpha2: 'XX',
        name: 'Test Country',
        verfuegbar: false,
      };

      expect(memberState.verfuegbar).toBe(false);
    });
  });

  describe('EUMemberState', () => {
    it('should accept valid member state', () => {
      const memberState: EUMemberState = {
        code: 'DE',
        available: true,
      };

      expect(memberState.code).toBe('DE');
      expect(memberState.available).toBe(true);
    });

    it('should accept unavailable member state', () => {
      const memberState: EUMemberState = {
        code: 'XX',
        available: false,
      };

      expect(memberState.available).toBe(false);
    });
  });

  describe('QualifiedResultCode', () => {
    it('should only accept valid validation results', () => {
      const validResults: QualifiedResultCode[] = ['A', 'B', 'C', 'D'];

      validResults.forEach((result) => {
        const qualifiedResultCode: QualifiedResultCode = result;
        expect(['A', 'B', 'C', 'D']).toContain(qualifiedResultCode);
      });
    });
  });

  describe('Request type aliases', () => {
    it('should accept SimpleRequest', () => {
      const request: SimpleRequest = {
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      };

      expect(request.vatIdOwn).toBe('DE123456789');
      expect(request.vatIdForeign).toBe('ATU12345678');
    });

    it('should accept QualifiedRequest', () => {
      const request: QualifiedRequest = {
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Test Company',
        location: 'Vienna',
      };

      expect(request.company).toBe('Test Company');
      expect(request.location).toBe('Vienna');
    });

    it('should accept QualifiedRequest with optional fields', () => {
      const request: QualifiedRequest = {
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Test Company',
        location: 'Vienna',
        street: 'Test Street 123',
        zip: '1010',
      };

      expect(request.street).toBe('Test Street 123');
      expect(request.zip).toBe('1010');
    });
  });

  describe('Type compatibility', () => {
    it('should allow SimpleRequest to be used as Request', () => {
      const simpleRequest: SimpleRequest = {
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      };

      const fullRequest: Request = simpleRequest;
      expect(fullRequest.vatIdOwn).toBe('DE123456789');
    });

    it('should allow QualifiedRequest to be used as ApiRequest', () => {
      const qualifiedRequest: QualifiedRequest = {
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Test Company',
        location: 'Vienna',
      };

      const fullRequest: Request = qualifiedRequest;
      expect(fullRequest.company).toBe('Test Company');
    });
  });
});
