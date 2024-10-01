import tkinter as tk
from tkinter import filedialog, messagebox
import random

class TicketPrioritizer:
    def __init__(self, master):
        self.master = master
        self.master.title("Ticket Prioritizer")
        self.master.geometry("600x400")

        self.tickets = []
        self.current_comparison = []
        self.comparisons_made = 0

        self.setup_ui()

    def setup_ui(self):
        self.load_button = tk.Button(self.master, text="Load Tickets", command=self.load_tickets)
        self.load_button.pack(pady=10)

        self.frame = tk.Frame(self.master)
        self.frame.pack(expand=True, fill='both')

        self.ticket1_button = tk.Button(self.frame, text="", wraplength=250, command=lambda: self.choose_ticket(0))
        self.ticket1_button.pack(side='left', expand=True, fill='both', padx=10, pady=10)

        self.ticket2_button = tk.Button(self.frame, text="", wraplength=250, command=lambda: self.choose_ticket(1))
        self.ticket2_button.pack(side='right', expand=True, fill='both', padx=10, pady=10)

        self.result_button = tk.Button(self.master, text="Show Results", command=self.show_results)
        self.result_button.pack(pady=10)
        self.result_button.pack_forget()

    def load_tickets(self):
        file_path = filedialog.askopenfilename(filetypes=[("Text files", "*.txt")])
        if file_path:
            with open(file_path, 'r') as file:
                self.tickets = [line.strip() for line in file if line.strip()]
            self.start_comparisons()

    def start_comparisons(self):
        if len(self.tickets) < 2:
            messagebox.showwarning("Warning", "Not enough tickets to compare.")
            return
        self.comparisons_made = 0
        self.get_next_comparison()

    def get_next_comparison(self):
        if self.comparisons_made >= len(self.tickets) * 2:  # Adjust this factor to change the number of comparisons
            self.finish_comparisons()
            return

        self.current_comparison = random.sample(self.tickets, 2)
        self.update_buttons()
        self.comparisons_made += 1

    def choose_ticket(self, choice):
        if choice == 0:
            self.tickets.remove(self.current_comparison[1])
            self.tickets.append(self.current_comparison[1])
        else:
            self.tickets.remove(self.current_comparison[0])
            self.tickets.append(self.current_comparison[0])

        self.get_next_comparison()

    def update_buttons(self):
        self.ticket1_button.config(text=self.current_comparison[0])
        self.ticket2_button.config(text=self.current_comparison[1])

    def finish_comparisons(self):
        self.ticket1_button.pack_forget()
        self.ticket2_button.pack_forget()
        self.result_button.pack()

    def show_results(self):
        result_window = tk.Toplevel(self.master)
        result_window.title("Prioritized Tickets")
        result_window.geometry("400x300")

        listbox = tk.Listbox(result_window, width=50)
        listbox.pack(padx=10, pady=10, expand=True, fill='both')

        for i, ticket in enumerate(self.tickets, 1):
            listbox.insert(tk.END, f"{i}. {ticket}")

if __name__ == "__main__":
    root = tk.Tk()
    app = TicketPrioritizer(root)
    root.mainloop()