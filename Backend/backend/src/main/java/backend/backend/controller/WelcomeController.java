package backend.backend.controller;

import backend.backend.entity.WelcomeEntity;
import backend.backend.repository.WelcomeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
public class WelcomeController {

    @Autowired
    private WelcomeRepository welcomeRepository;

    @GetMapping("/welcomeForm")
    public String showWelcomeForm(Model model) {
        model.addAttribute("welcome", new WelcomeEntity());
        return "welcomeForm";
    }

    @PostMapping("/welcome")
    public String processWelcomeForm(@ModelAttribute("welcome") @Valid WelcomeEntity welcome, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "welcomeForm";
        }
        welcomeRepository.save(welcome);
        model.addAttribute("welcome", welcome);
        return "welcomeSummary";
    }

    @GetMapping("/getAllWelcomes")
    public String getAllWelcomes(Model model) {
        List<WelcomeEntity> welcomes = welcomeRepository.findAll();
        model.addAttribute("welcomes", welcomes);
        return "getAllWelcomes";
    }

    @PostMapping("/deleteWelcome/{id}")
    public String deleteWelcomeById(@PathVariable Long id) {
        welcomeRepository.deleteById(id);
        return "redirect:/getAllWelcomes";
    }

    @GetMapping("/updateWelcome/{id}")
    public String showUpdateWelcomeForm(@PathVariable Long id, Model model) {
        Optional<WelcomeEntity> welcome = welcomeRepository.findById(id);
        welcome.ifPresent(w -> model.addAttribute("welcome", w));
        return "updateWelcomeForm";
    }

    @PostMapping("/updateWelcome/{id}")
    public String updateWelcome(@PathVariable Long id, @ModelAttribute("welcome") @Valid WelcomeEntity updatedWelcome, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "updateWelcomeForm";
        }
        if (welcomeRepository.findById(id).isPresent()) {
            WelcomeEntity existingWelcome = welcomeRepository.findById(id).get();
            existingWelcome.setName(updatedWelcome.getName());
            existingWelcome.setLogo(updatedWelcome.getLogo());
            existingWelcome.setMainCurrency(updatedWelcome.getMainCurrency());
            existingWelcome.setOtherCurrencies(updatedWelcome.getOtherCurrencies());
            existingWelcome.setDeviceLock(updatedWelcome.isDeviceLock());
            welcomeRepository.save(existingWelcome);
            model.addAttribute("welcome", existingWelcome);
        }
        return "redirect:/getAllWelcomes";
    }
}
