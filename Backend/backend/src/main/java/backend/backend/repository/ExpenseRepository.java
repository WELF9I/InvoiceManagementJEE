package backend.backend.repository;

import backend.backend.controller.ExpenseData;
import backend.backend.entity.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {
    List<ExpenseEntity> findAll();
    Optional<ExpenseEntity> findById(Long id);
    ExpenseEntity save(ExpenseEntity entity);
    void deleteById(Long id);
    long count();
    boolean existsById(Long id);

    @Query("SELECT NEW backend.backend.controller.ExpenseData(e.idExp, w.id, c.idCat, c.categoryName, e.amount, e.dateExpense, e.pdfFile, c.categoryImage, w.mainCurrency, w.otherCurrencies) FROM ExpenseEntity e JOIN e.welcomeEntity w JOIN e.categoryEntity c")
    List<ExpenseData> fetchExpenseData();

}
