import { PetModel } from '../../types/pet';
import { CryptoSealService } from './cryptoSeal';

export interface PetPassportPackage {
  v: number;
  owner: string;
  pet: PetModel;
  seal: string;
  issuedAt: number;
}

export class PetPassportService {
  public static exportPassport(pet: PetModel, owner = 'Tamer'): string {
    const seal = CryptoSealService.createPetSeal(pet);
    const pkg: PetPassportPackage = {
      v: 2,
      owner,
      pet,
      seal,
      issuedAt: Date.now(),
    };

    const json = JSON.stringify(pkg);
    // Base64 encoding compatible with browser and node
    if (typeof btoa === 'function') {
      return btoa(encodeURIComponent(json));
    }
    return Buffer.from(encodeURIComponent(json)).toString('base64');
  }

  public static importPassport(token: string): { pet: PetModel; isValid: boolean; owner: string; issuedAt: number } | null {
    try {
      let json = '';
      if (typeof atob === 'function') {
        json = decodeURIComponent(atob(token));
      } else {
        json = decodeURIComponent(Buffer.from(token, 'base64').toString('utf8'));
      }

      const pkg = JSON.parse(json) as PetPassportPackage;
      if (!pkg || !pkg.pet || !pkg.seal) return null;

      const isValid = CryptoSealService.verifyPetSeal(pkg.pet, pkg.seal);
      return {
        pet: pkg.pet,
        isValid,
        owner: pkg.owner || 'Guest Tamer',
        issuedAt: pkg.issuedAt || Date.now(),
      };
    } catch (e) {
      console.warn('Could not parse Pet Passport token:', e);
      return null;
    }
  }

  public static generateShareableUrl(pet: PetModel, owner = 'Tamer'): string {
    const token = this.exportPassport(pet, owner);
    if (typeof window !== 'undefined' && window.location) {
      const base = window.location.origin + window.location.pathname;
      return `${base}?passport=${encodeURIComponent(token)}`;
    }
    return `https://theymightbyte.app/?passport=${encodeURIComponent(token)}`;
  }
}
