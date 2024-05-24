package backend.backend.controller;

import java.util.Date;

public class ExpenseData {
    private Long idExp;
    private Long idUser;
    private Long idCat;
    private String categoryName;
    private String amount;
    private Date dateExpense;
    private byte[] pdfFile;
    private byte[] categoryImage;
    private String mainCurrency;
    private String otherCurrencies;

    public ExpenseData() {}
    public ExpenseData(Long idExp, Long idUser, Long idCat, String categoryName, String amount, Date dateExpense, byte[] pdfFile, byte[] categoryImage, String mainCurrency, String otherCurrencies) {
        this.idExp = idExp;
        this.idUser = idUser;
        this.idCat = idCat;
        this.categoryName = categoryName;
        this.amount = amount;
        this.dateExpense = dateExpense;
        this.pdfFile = pdfFile;
        this.categoryImage = categoryImage;
        this.mainCurrency = mainCurrency;
        this.otherCurrencies = otherCurrencies;
    }

    public Long getIdExp() {
        return idExp;
    }

    public void setIdExp(Long idExp) {
        this.idExp = idExp;
    }


    public Long getIdUser() {
        return idUser;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public Long getIdCat() {
        return idCat;
    }

    public void setIdCat(Long idCat) {
        this.idCat = idCat;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public Date getDateExpense() {
        return dateExpense;
    }

    public void setDateExpense(Date dateExpense) {
        this.dateExpense = dateExpense;
    }

    public byte[] getPdfFile() {
        return pdfFile;
    }

    public void setPdfFile(byte[] pdfFile) {
        this.pdfFile = pdfFile;
    }

    public byte[] getCategoryImage() {
        return categoryImage;
    }

    public void setCategoryImage(byte[] categoryImage) {
        this.categoryImage = categoryImage;
    }

    public String getMainCurrency() {
        return mainCurrency;
    }

    public void setMainCurrency(String mainCurrency) {
        this.mainCurrency = mainCurrency;
    }

    public String getOtherCurrencies() {
        return otherCurrencies;
    }

    public void setOtherCurrencies(String otherCurrencies) {
        this.otherCurrencies = otherCurrencies;
    }
}
