export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Customer {
  id?: string;
  fullName: string;
  cpf?: string;
  email: string;
  phoneNumber: string;
  additionalPhone?: string;
  birthDate: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  address?: Address | null;
  createdAt?: string;
}
