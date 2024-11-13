type profile = {
    id?: number;
    name?: string;
    age?: number;
    gender?: "남성" | "여성" | "미상";
    citizenship?: "내국인" | "외국인" | "미상";
    location?: string;
}

type KtasSymptom = {
    id: number;
    name: string;
    code: string;
    severity: number;
    location?: string;
}

type preKtas = {
    id: number;
    name?: string;
    age: number;
    gender: "남성" | "여성" | "미상";
    citizenship: "내국인" | "외국인" | "미상";
    location?: string;
    ktasCode: string;
    category: string;
    subcategory: string;
    symptom: string;
    severity: number;
}

type finding = preKtas

type complete = finding & {
    hospitalId: string;
    hospitalName: string;
    hospitalLat: number;
    hospitalLong: number;
}

export type { profile, preKtas, finding, complete, KtasSymptom };