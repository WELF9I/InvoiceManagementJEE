package backend.backend.repository;

import backend.backend.entity.IncomeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<IncomeEntity, Long> {
    List<IncomeEntity> findAll();
    Optional<IncomeEntity> findById(Long id);
    IncomeEntity save(IncomeEntity entity);
    void deleteById(Long id);
    long count();
    boolean existsById(Long id);
}
