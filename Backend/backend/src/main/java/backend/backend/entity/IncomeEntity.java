package backend.backend.entity;

import backend.backend.entity.WelcomeEntity;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "incomes")
public class IncomeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInc;

    private String amount;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateIncome;

    @Lob
    @Column(name="pdfFile",columnDefinition = "LONGBLOB")
    private byte[] pdfFile;

    @ManyToOne
    @JoinColumn(name = "idUser", referencedColumnName = "id")
    private WelcomeEntity welcomeEntity;

    @ManyToOne
    @JoinColumn(name = "idCat", referencedColumnName = "idCat")
    private CategoryEntity categoryEntity;

    public Long getIdInc() {
        return idInc;
    }

    public void setIdInc(Long idInc) {
        this.idInc = idInc;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public Date getDateIncome() {
        return dateIncome;
    }

    public void setDateIncome(Date dateIncome) {
        this.dateIncome = dateIncome;
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
