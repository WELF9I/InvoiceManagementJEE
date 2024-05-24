package backend.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Arrays;

@Entity
@Table(name = "categories")
public class CategoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCat;

    @NotEmpty(message = "Category cannot be empty")
    @Size(max = 50, message = "Category name length must be less than or equal to 50 characters")
    @Column(name = "categoryName", nullable = false, length = 50)
    private String categoryName;

    @Lob
    @Column(name = "categoryImage",columnDefinition = "LONGBLOB")
    private byte[] categoryImage;

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

    public byte[] getCategoryImage() {
        return categoryImage;
    }

    public void setCategoryImage(byte[] categoryImage) {
        this.categoryImage = categoryImage;
    }
}
