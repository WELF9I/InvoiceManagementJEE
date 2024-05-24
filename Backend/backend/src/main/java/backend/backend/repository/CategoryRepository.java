package backend.backend.repository;

import backend.backend.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    List<CategoryEntity> findAll();
    Optional<CategoryEntity> findById(Long id);
    CategoryEntity save(CategoryEntity entity);
    void deleteById(Long id);
    long count();
    boolean existsById(Long id);
}
