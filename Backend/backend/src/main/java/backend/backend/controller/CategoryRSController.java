package backend.backend.controller;

import backend.backend.entity.CategoryEntity;
import backend.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/categories")
@RestController
public class CategoryRSController {

    @Autowired
    private CategoryRepository categoryRepository;
    @CrossOrigin(origins = "http://localhost:8081")

    @GetMapping(value = "/", produces = {MediaType.APPLICATION_JSON_VALUE})
    public List<CategoryEntity> getAll() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryEntity> getCategoryById(@PathVariable Long id) {
        Optional<CategoryEntity> categoryOptional = categoryRepository.findById(id);
        return categoryOptional.map(category -> new ResponseEntity<>(category, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<String> addCategory(@RequestBody CategoryEntity newCategory) {
        categoryRepository.save(newCategory);
        return new ResponseEntity<>("Category added successfully", HttpStatus.CREATED);
    }



    @PutMapping("/{id}")
    public ResponseEntity<String> updateCategory(@PathVariable Long id, @RequestBody CategoryEntity updatedCategory) {
        if (categoryRepository.existsById(id)) {
            updatedCategory.setIdCat(id);
            categoryRepository.save(updatedCategory);
            return new ResponseEntity<>("Category updated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Category not found", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return new ResponseEntity<>("Category with ID " + id + " deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Category with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
    }
}
