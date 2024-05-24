package backend.backend.entity;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "expenses")
public class ExpenseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idExp;

    private String amount;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateExpense;

    @Lob
    @Column(name="pdfFile",columnDefinition = "LONGBLOB")
    private byte[] pdfFile;

    @ManyToOne
    @JoinColumn(name = "idUser", referencedColumnName = "id")
    private WelcomeEntity welcomeEntity;

    @ManyToOne
    @JoinColumn(name = "idCat", referencedColumnName = "idCat")
    private CategoryEntity categoryEntity;

    public Long getIdExp() {
        return idExp;
    }

    public void setIdExp(Long idExp) {
        this.idExp = idExp;
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

    public WelcomeEntity getWelcomeEntity() {
        return welcomeEntity;
    }

    public void setWelcomeEntity(WelcomeEntity welcomeEntity) {
        this.welcomeEntity = welcomeEntity;
    }

    public CategoryEntity getCategoryEntity() {
        return categoryEntity;
    }

    public void setCategoryEntity(CategoryEntity categoryEntity) {
        this.categoryEntity = categoryEntity;
    }
}
