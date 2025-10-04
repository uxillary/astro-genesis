export type PaperIndex = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  organism: string;
  platform: string;
  keywords: string[];
};

export type PaperDetail = PaperIndex & {
  sections: {
    abstract: string;
    methods: string;
    results: string;
    conclusion: string;
  };
  links: {
    taskbook?: string;
    osdr?: string;
  };
};

export type FilterState = {
  organism: string | null;
  platform: string | null;
  year: number | null;
};
