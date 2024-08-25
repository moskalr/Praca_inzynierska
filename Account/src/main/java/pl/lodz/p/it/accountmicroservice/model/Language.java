package pl.lodz.p.it.accountmicroservice.model;

public enum Language {
    EN("EN"),
    PL("PL");

    private final String lang;
    Language(String lang) {
        this.lang = lang;
    }

    public String getStringLanguage() {
        return lang;
    }

}
