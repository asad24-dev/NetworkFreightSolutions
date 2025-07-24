// Modern Interactive Enhancements for NFS Logistics
$(document).ready(function() {
    
    // Counter Animation for Statistics
    function animateCounter() {
        $('.counter').each(function() {
            const $this = $(this);
            const countTo = $this.attr('data-count');
            
            $({ countNum: $this.text()}).animate({
                countNum: countTo
            }, {
                duration: 2000,
                easing: 'swing',
                step: function() {
                    $this.text(Math.floor(this.countNum));
                },
                complete: function() {
                    $this.text(this.countNum);
                }
            });
        });
    }

    // Trigger counter animation when stats section is in view
    function handleStatsAnimation() {
        const statsSection = $('#section-stats');
        if (statsSection.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(statsSection[0]);
        }
    }

    // Animated counter for statistics on scroll
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    if (counter.getAttribute('data-animated') === 'true') return;
                    counter.setAttribute('data-animated', 'true');

                    const updateCount = () => {
                        const target = +counter.getAttribute('data-count');
                        const count = +counter.innerText;
                        const speed = 200; 
                        const inc = target / speed;

                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 15);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
                // We can unobserve if we want the animation to run only once
                // observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.5 // Starts when 50% of the section is visible
    });

    const statsSection = document.querySelector('#section-stats');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }

    // Enhanced Button Click Effects
    $('.btn-primary').on('click', function(e) {
        const btn = $(this);
        const ripple = $('<span class="ripple-effect"></span>');
        
        btn.append(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    // Enhanced Card Hover Effects
    $('.service-item').hover(
        function() {
            $(this).find('.service-icon').addClass('bounce-animation');
        },
        function() {
            $(this).find('.service-icon').removeClass('bounce-animation');
        }
    );

    // Smooth Section Transitions
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 800, 'easeInOutQuart');
        }
    });

    // Enhanced Navbar Scroll Effect
    let lastScrollTop = 0;
    $(window).scroll(function() {
        const currentScroll = $(this).scrollTop();
        const navbar = $('.site-navbar');
        
        if (currentScroll > 100) {
            navbar.addClass('scrolled');
            
            // Hide/show navbar on scroll
            if (currentScroll > lastScrollTop && currentScroll > 200) {
                navbar.addClass('nav-hidden');
            } else {
                navbar.removeClass('nav-hidden');
            }
        } else {
            navbar.removeClass('scrolled nav-hidden');
        }
        
        lastScrollTop = currentScroll;
    });

    // Parallax Effect Enhancement
    $(window).scroll(function() {
        const scrolled = $(this).scrollTop();
        const parallaxElements = $('.floating-shape');
        
        parallaxElements.each(function() {
            const speed = $(this).data('speed') || 0.5;
            const yPos = -(scrolled * speed);
            $(this).css('transform', `translateY(${yPos}px)`);
        });
    });

    // Form Enhancement
    $('.form-control').focus(function() {
        $(this).parent().addClass('form-focused');
    }).blur(function() {
        $(this).parent().removeClass('form-focused');
    });

    // Loading Animation for Form Submission
    $('form').on('submit', function(e) {
        e.preventDefault();
        const submitBtn = $(this).find('input[type="submit"]');
        const originalText = submitBtn.val();
        
        submitBtn.val('Sending...').prepend('<div class="loading-spinner"></div>');
        
        // Simulate form submission
        setTimeout(() => {
            submitBtn.html('Message Sent! ✓').removeClass('btn-primary').addClass('btn-success');
            setTimeout(() => {
                submitBtn.val(originalText).removeClass('btn-success').addClass('btn-primary');
            }, 3000);
        }, 2000);
    });

    // Initialize animations
    handleStatsAnimation();
    
    // Add custom easing
    $.easing.easeInOutQuart = function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    };
});

// Modern Cursor Effect (Optional)
$(document).mousemove(function(e) {
    $('.cursor-dot').css({
        left: e.clientX,
        top: e.clientY
    });
    
    $('.cursor-outline').css({
        left: e.clientX,
        top: e.clientY
    });
});

// Page Loading Animation
$(window).on('load', function() {
    $('.page-loader').fadeOut(500);
    $('body').removeClass('loading');
});
