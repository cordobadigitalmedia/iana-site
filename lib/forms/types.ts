export type {
  PreliminaryPersonalFormData,
} from './schemas/preliminary-personal-schema';

export type {
  PreliminaryEducationFormData,
} from './schemas/preliminary-education-schema';

export type {
  PreliminaryBusinessFormData,
} from './schemas/preliminary-business-schema';

export type {
  FinalApplicationFormData,
} from './schemas/final-application-schema';

export type ApplicationType =
  | 'preliminary-personal'
  | 'preliminary-education'
  | 'preliminary-business'
  | 'final';


