package backend.backend.repository;

import backend.backend.entity.WelcomeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WelcomeRepository extends JpaRepository<WelcomeEntity, Long> {

    List<WelcomeEntity> findAll();

    Optional<WelcomeEntity> findById(Long id);

    WelcomeEntity save(WelcomeEntity entity);

    void deleteById(Long id);

    long count();

    boolean existsById(Long id);
}
