package backend.backend.entity;

import jakarta.persistence.*;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "user")
public class WelcomeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty(message = "Name cannot be empty")
    @Size(max = 50, message = "Name length must be less than or equal to 50 characters")
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Lob
    @Column(name = "logo", columnDefinition = "LONGBLOB")
    private byte[] logo;

    @NotEmpty(message = "Main currency cannot be empty")
    @Column(name = "mainCurrency", nullable = false, length = 3)
    private String mainCurrency;

    @Column(name = "otherCurrencies", nullable = true, length = 15)
    private String otherCurrencies;

    @Column(name = "deviceLock", nullable = false, length = 5)
    private boolean deviceLock = false;

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public byte[] getLogo() {
        return logo;
    }

    public void setLogo(byte[] logo) {
        this.logo = logo;
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

    public boolean isDeviceLock() {
        return deviceLock;
    }

    public void setDeviceLock(boolean deviceLock) {
        this.deviceLock = deviceLock;
    }
}
