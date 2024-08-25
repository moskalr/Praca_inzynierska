package pl.lodz.p.it.socialfridgemicroservice.enums;

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