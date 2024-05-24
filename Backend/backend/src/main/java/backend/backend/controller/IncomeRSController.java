package backend.backend.controller;

import backend.backend.entity.IncomeEntity;
import backend.backend.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/incomes")
@RestController

public class IncomeRSController {

    @Autowired
    private IncomeRepository incomeRepository;
    @CrossOrigin(origins = "http://localhost:8081")
    @GetMapping(value = "/", produces = {MediaType.APPLICATION_JSON_VALUE})
    public List<IncomeEntity> getAll() {
        return incomeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeEntity> getIncomeById(@PathVariable Long id) {
        Optional<IncomeEntity> incomeOptional = incomeRepository.findById(id);
        return incomeOptional.map(income -> new ResponseEntity<>(income, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<String> addIncome(@RequestBody IncomeEntity newIncome) {
        incomeRepository.save(newIncome);
        return new ResponseEntity<>("Income added successfully", HttpStatus.CREATED);
    }



    @PutMapping("/{id}")
    public ResponseEntity<String> updateIncome(@PathVariable Long id, @RequestBody IncomeEntity updatedIncome) {
        if (incomeRepository.existsById(id)) {
            updatedIncome.setIdInc(id);
            incomeRepository.save(updatedIncome);
            return new ResponseEntity<>("Income updated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Income not found", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIncome(@PathVariable Long id) {
        if (incomeRepository.existsById(id)) {
            incomeRepository.deleteById(id);
            return new ResponseEntity<>("Income with ID " + id + " deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Income with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
    }
}
