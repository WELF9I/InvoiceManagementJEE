package backend.backend.controller;

import backend.backend.entity.WelcomeEntity;
import backend.backend.repository.WelcomeRepository;
import backend.backend.repository.ExpenseRepository;
import backend.backend.repository.IncomeRepository;
import backend.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/user")
@RestController
public class WelcomeRSController {

    @Autowired
    public WelcomeRepository welcomeRepository;

    @Autowired
    public ExpenseRepository expenseRepository;

    @Autowired
    public CategoryRepository categoryRepository;
    @Autowired
    public IncomeRepository incomeRepository;

    @GetMapping(value = "/", produces = {MediaType.APPLICATION_JSON_VALUE})
    public List<WelcomeEntity> getAll() {
        return welcomeRepository.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<WelcomeEntity> getWelcomeById(@PathVariable Long id) {
        Optional<WelcomeEntity> welcomeOptional = welcomeRepository.findById(id);
        return welcomeOptional.map(welcome -> new ResponseEntity<>(welcome, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateWelcome(@PathVariable Long id, @RequestBody WelcomeEntity updatedWelcome) {
        Optional<WelcomeEntity> optionalWelcome = welcomeRepository.findById(id);
        if (optionalWelcome.isPresent()) {
            WelcomeEntity existingWelcome = optionalWelcome.get();
            existingWelcome.setId(id);
            existingWelcome.setName(updatedWelcome.getName());
            existingWelcome.setLogo(updatedWelcome.getLogo());
            existingWelcome.setMainCurrency(updatedWelcome.getMainCurrency());
            existingWelcome.setOtherCurrencies(updatedWelcome.getOtherCurrencies());
            existingWelcome.setDeviceLock(updatedWelcome.isDeviceLock());
            welcomeRepository.save(existingWelcome);
            return new ResponseEntity<>("Welcome updated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Welcome not found", HttpStatus.NOT_FOUND);
        }
    }

    @CrossOrigin(origins = "http://localhost:8081")
    @PostMapping("/")
    public ResponseEntity<String> addWelcome(@RequestBody WelcomeEntity newWelcome) {
        welcomeRepository.save(newWelcome);
        return new ResponseEntity<>("Welcome added successfully", HttpStatus.CREATED);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWelcome(@PathVariable Long id) {
        if (welcomeRepository.existsById(id)) {
            welcomeRepository.deleteById(id);
            return new ResponseEntity<>("Welcome with ID " + id + " deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Welcome with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/expenseData")
    public ResponseEntity<List<ExpenseData>> expenseDataFetcher() {
        try {
            List<ExpenseData> expenseDataList = expenseRepository.fetchExpenseData();
            if (expenseDataList.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(expenseDataList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
